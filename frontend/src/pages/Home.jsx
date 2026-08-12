import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import PageLoader from '../components/PageLoader/PageLoader';
import Hero from '../components/Hero/Hero';
import DestinationSection from '../components/Destinations/DestinationSection';
import CategoryTabs from '../components/Categories/CategoryTabs';
import FeaturedStays from '../components/Properties/FeaturedStays';
import WhyStayNest from '../components/Features/WhyStayNest';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import HostCTA from '../components/HostCTA/HostCTA';
import TestimonialCarousel from '../components/Testimonials/TestimonialCarousel';
import AnimatedStats from '../components/Statistics/AnimatedStats';
import Newsletter from '../components/Newsletter/Newsletter';
import Footer from '../components/Footer/Footer';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate(user.role === 'host' ? '/host/dashboard' : '/guest', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only enable custom cursor on non-touch desktop devices
    const checkIsDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setIsDesktop(checkIsDesktop);
    
    if (checkIsDesktop) {
      const updateMousePosition = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', updateMousePosition);
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <PageLoader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {isDesktop && !loading && (
        <motion.div
          className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] hidden lg:block mix-blend-difference bg-white/80"
          animate={{
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
          }}
          transition={{ type: "spring", stiffness: 800, damping: 40, mass: 0.1 }}
        />
      )}

      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="min-h-screen bg-gray-50 flex flex-col relative"
        >
          <Navbar transparentOnTop={true} />
          
          <main className="flex-grow">
            <Hero />
            <CategoryTabs />
            <DestinationSection />
            <FeaturedStays />
            <HostCTA />
            <WhyStayNest />
            <HowItWorks />
            <TestimonialCarousel />
            <AnimatedStats />
            <Newsletter />
          </main>
          
          <Footer />
        </motion.div>
      )}
    </>
  );
};

export default Home;
