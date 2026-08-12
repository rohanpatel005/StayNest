import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import RoleSelector from '../components/auth/RoleSelector';
import { fadeUp, staggerContainer, imageReveal, fadeIn } from '../animations/motionVariants';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'host' ? '/host/dashboard' : '/guest', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.name.length < 3) {
      return setError('Name must be at least 3 characters');
    }
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setIsLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        setSignupSuccess(true);
        setTimeout(() => {
          navigate('/login', { state: { message: 'Registration successful. Please login.' } });
        }, 1200); // Allow time for success animation
      } else {
        setError(res.message || 'Registration failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex bg-white overflow-hidden"
    >
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 py-12 md:px-16 md:py-12 overflow-y-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium w-fit mb-8 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to StayNest
        </Link>

        <div className="w-full max-w-sm mx-auto my-auto">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <div className="mb-10">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-gray-900 leading-tight">
                Create your StayNest account
                <div className="h-1 w-12 bg-brand-500 mt-4 rounded-full"></div>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-500 mt-4 text-sm">
                Your next stay is just a few steps away.
              </motion.p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div variants={fadeIn} initial="hidden" animate="show" exit="hidden" className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-200">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {signupSuccess ? (
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
                  <h3 className="text-xl font-bold text-gray-900">Account created successfully</h3>
                  <p className="text-gray-500 text-sm mt-1">Redirecting to login...</p>
                </motion.div>
              ) : (
                <motion.form variants={staggerContainer} onSubmit={handleSubmit}>
                  <motion.div variants={fadeUp}>
                    <AuthInput
                      label="Full Name"
                      type="text"
                      name="name"
                      icon={User}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      error={error?.toLowerCase().includes('name') ? error : null}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <AuthInput
                      label="Email"
                      type="email"
                      name="email"
                      icon={Mail}
                      placeholder="Enter your email"
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
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      error={error?.toLowerCase().includes('password') ? error : null}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <RoleSelector 
                      selectedRole={formData.role} 
                      onChange={handleRoleChange} 
                    />
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <AuthButton type="submit" isLoading={isLoading} className="mt-2">
                      Create Account
                    </AuthButton>
                  </motion.div>

                  <motion.div variants={fadeUp} className="mt-8 text-center text-sm text-gray-500 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-gray-900 hover:text-brand-500 transition-colors">
                      Login
                    </Link>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Right side - Cinematic Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-900 group">
        <div className="absolute inset-0 bg-black/20 z-10 transition-opacity duration-700 group-hover:bg-black/30"></div>
        <motion.img 
          variants={imageReveal}
          initial="hidden"
          animate="show"
          src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Coastal home" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-out group-hover:scale-105 origin-bottom"
        />
        
        <div className="relative z-20 flex flex-col justify-end h-full p-12 text-right">
          <div className="ml-auto max-w-md">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold text-white mb-4 leading-tight"
            >
              Your world is worth sharing.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg text-white/90"
            >
              Turn your extra space into extra income on StayNest, or find the perfect place for your next adventure.
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Signup;
