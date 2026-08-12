import api from './axios';

export const authApi = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  verifyResetOTP: async (data) => {
    const response = await api.post('/auth/verify-reset-otp', data);
    return response.data;
  },
  
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};
