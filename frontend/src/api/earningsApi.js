import api from './axios';

export const earningsApi = {
  getEarnings: async () => {
    const response = await api.get('/host/earnings');
    return response.data;
  },

  getEarningsOverview: async () => {
    const response = await api.get('/host/earnings/overview');
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await api.get('/host/earnings/transactions', { params });
    return response.data;
  }
};
