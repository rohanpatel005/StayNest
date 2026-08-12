import api from './axios';

export const bookingApi = {
  getBookings: async (params) => {
    const response = await api.get('/host/bookings', { params });
    return response.data;
  },

  getRecentBookings: async (limit = 4) => {
    const response = await api.get(`/host/bookings/recent?limit=${limit}`);
    return response.data;
  },

  getBooking: async (id) => {
    const response = await api.get(`/host/bookings/${id}`);
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/host/bookings/${id}/status`, { status });
    return response.data;
  }
};
