import api from './axios';

export const guestApi = {
  getDashboard: async () => {
    const response = await api.get('/guest/dashboard');
    return response.data;
  },
  
  getTrips: async () => {
    const response = await api.get('/guest/bookings');
    return response.data;
  },
  
  getTrip: async (id) => {
    const response = await api.get(`/guest/bookings/${id}`);
    return response.data;
  },
  
  getWishlist: async () => {
    const response = await api.get('/guest/wishlist');
    return response.data;
  },
  
  addToWishlist: async (listingId) => {
    const response = await api.post(`/guest/wishlist/${listingId}`);
    return response.data;
  },
  
  removeFromWishlist: async (listingId) => {
    const response = await api.delete(`/guest/wishlist/${listingId}`);
    return response.data;
  },

  pricePreview: async (data) => {
    const response = await api.post('/guest/bookings/price-preview', data);
    return response.data;
  },

  createOrder: async (data) => {
    const response = await api.post('/guest/bookings/create-order', data);
    return response.data;
  },

  getRefundPreview: async (id) => {
    const response = await api.get(`/guest/bookings/${id}/refund`);
    return response.data;
  },

  cancelBooking: async (id, data) => {
    const response = await api.post(`/guest/bookings/${id}/cancel`, data);
    return response.data;
  }
};
