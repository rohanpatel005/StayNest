import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import { Home as HomeIcon } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [resetToken, setResetToken] = useState('');
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
    // Check if token was passed from the OTP verification step
    if (location.state?.resetToken) {
      setResetToken(location.state.resetToken);
    } else {
      // If no token, redirect to login
      navigate('/login');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.newPassword.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        resetToken,
        newPassword: formData.newPassword
      });
      
      if (res.success) {
        // Navigate to login with success message
        navigate('/login', { 
          state: { message: 'Password reset successfully. Please login with your new password.' } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The session may have expired.');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Please enter your new password below.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            placeholder="Min. 8 characters"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
