import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import { fadeUp, staggerContainer, imageReveal, fadeIn } from '../animations/motionVariants';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'host' ? '/host/dashboard' : '/guest', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await login(formData);
      if (res.success) {
        setLoginSuccess(true);
        setTimeout(() => {
          let from = location.state?.from?.pathname;
          if (!from || from === '/') {
            if (res.user?.role === 'host') {
              from = '/host/dashboard';
            } else {
              from = '/guest';
            }
          }
          navigate(from, { replace: true });
        }, 800); // Short delay for success animation
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex bg-white overflow-hidden"
    >
      {/* Left side - Cinematic Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-900 group">
        <div className="absolute inset-0 bg-black/30 z-10 transition-opacity duration-700 group-hover:bg-black/40"></div>
        <motion.img 
          variants={imageReveal}
          initial="hidden"
          animate="show"
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury apartment" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-105"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl w-fit">
            StayNest
          </Link>
          
          <div className="max-w-md">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold text-white mb-4 leading-tight"
            >
              Find places that feel like home.
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="inline-flex flex-col bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white mt-8"
            >
              <div className="flex gap-1 mb-1 text-brand-400">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <span className="font-medium text-sm">4.9 Guest Rating</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 py-12 md:px-16 md:py-16 overflow-y-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium w-fit mb-12 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to StayNest
        </Link>

        <div className="w-full max-w-sm mx-auto my-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <div className="mb-10">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900">
                Welcome back
                <div className="h-1 w-12 bg-brand-500 mt-4 rounded-full"></div>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 mt-4 text-sm">
                Sign in to continue your StayNest journey.
              </motion.p>
            </div>
            
            <AnimatePresence mode="wait">
              {successMessage && !loginSuccess && (
                <motion.div variants={fadeIn} initial="hidden" animate="show" exit="hidden" className="bg-green-50 text-green-700 p-3 rounded-xl text-sm mb-6 border border-green-200">
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loginSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900">Login successful</h3>
                  <p className="text-gray-500 text-sm mt-1">Redirecting...</p>
                </motion.div>
              ) : (
                <motion.form variants={staggerContainer} onSubmit={handleSubmit} className="space-y-4">
                  <motion.div variants={fadeUp}>
                    <AuthInput
                      label="Email"
                      type="email"
                      name="email"
                      icon={Mail}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={error?.toLowerCase().includes('email') ? error : null}
                      required
                    />
                  </motion.div>
                  
                  <motion.div variants={fadeUp}>
                    <AuthInput
                      label="Password"
                      type="password"
                      name="password"
                      icon={Lock}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      error={error?.toLowerCase().includes('password') || (error && !error.toLowerCase().includes('email')) ? error : null}
                      required
                    />
                    <div className="flex justify-end -mt-2 mb-2">
                      <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-brand-500 font-medium transition-colors relative group">
                        Forgot Password?
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-brand-500 transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <AuthButton type="submit" isLoading={isLoading} className="mt-4">
                      Login
                    </AuthButton>
                  </motion.div>



                  <motion.div variants={fadeUp} className="mt-8 text-center text-sm text-gray-500 font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-bold text-gray-900 hover:text-brand-500 transition-colors">
                      Create account
                    </Link>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
