import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { fadeUp } from '../../animations/motionVariants';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <section className="py-24 bg-brand-50">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Get inspiration for your next trip
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Subscribe to our newsletter and receive curated travel content and exclusive deals directly in your inbox.
          </motion.p>

          <motion.form 
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="relative max-w-md mx-auto"
          >
            <div className={`relative flex items-center bg-white rounded-full p-2 transition-shadow duration-300 ${isFocused ? 'shadow-lg ring-2 ring-brand-500/20' : 'shadow-sm border border-gray-200'}`}>
              <div className="relative flex-1 px-4">
                <label 
                  className={`absolute left-4 transition-all duration-200 pointer-events-none text-gray-400 ${
                    isFocused || email ? 'text-xs -top-0.5 opacity-0' : 'text-base top-1/2 -translate-y-1/2'
                  }`}
                >
                  Your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent outline-none text-gray-900 pt-1"
                  required
                />
              </div>
              
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-emerald-500 text-white p-3 md:px-6 md:py-3 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.button
                    key="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={status === 'loading'}
                    className="group bg-gray-900 hover:bg-black text-white p-3 md:px-6 md:py-3 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                  >
                    <span className="hidden md:inline font-medium">
                      {status === 'loading' ? 'Sending...' : 'Subscribe'}
                    </span>
                    {status !== 'loading' && (
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
