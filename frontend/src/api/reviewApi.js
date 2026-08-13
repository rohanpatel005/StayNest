import api from './axios';

export const reviewApi = {
  getReviews: async (params) => {
    const response = await api.get('/host/reviews', { params });
    return response.data;
  },

  replyToReview: async (id, hostReply) => {
    const response = await api.patch(`/host/reviews/${id}/reply`, { hostReply });
    return response.data;
  },

  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  getReviewByBooking: async (bookingId) => {
    const response = await api.get(`/reviews/booking/${bookingId}`);
    return response.data;
  },

  getListingReviews: async (listingId) => {
    const response = await api.get(`/reviews/listing/${listingId}`);
    return response.data;
  }
};
