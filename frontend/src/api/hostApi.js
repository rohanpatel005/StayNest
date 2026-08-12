import api from './axios';

export const hostApi = {
  getDashboard: async () => {
    const response = await api.get('/host/dashboard');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/host/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/host/profile', data);
    return response.data;
  }
};
