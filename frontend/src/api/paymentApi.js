import api from './axios';

export const paymentApi = {
  verifyPayment: async (data) => {
    const response = await api.post('/payments/verify', data);
    return response.data;
  },
};
