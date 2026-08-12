import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import { Home as HomeIcon, ArrowLeft } from 'lucide-react';

const VerifyResetOTP = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'host' ? '/host/dashboard' : '/guest', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if email was passed from the previous step
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email, redirect back to forgot password
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      return setError('OTP must be exactly 6 digits');
    }

    setIsLoading(true);

    try {
      const res = await authApi.verifyResetOTP({ email, otp });
      if (res.success && res.resetToken) {
        // Navigate to reset password and pass the token
        navigate('/reset-password', { 
          state: { resetToken: res.resetToken } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link to="/" className="inline-flex items-center gap-2 text-brand-500 font-bold text-3xl mb-8">
        <HomeIcon className="h-8 w-8" /> StayNest
      </Link>
      
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Link to="/forgot-password" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
        <p className="text-gray-500 mb-6 text-sm">
          We've sent a 6-digit OTP to <span className="font-semibold">{email}</span>. It will expire in 10 minutes.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex justify-center">
            <Input
              label="Enter 6-digit OTP"
              type="text"
              name="otp"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest h-14 font-mono"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-2" isLoading={isLoading} disabled={otp.length !== 6}>
            Verify OTP
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetOTP;
